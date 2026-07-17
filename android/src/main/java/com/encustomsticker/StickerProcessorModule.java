package com.encustomsticker;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.segmentation.subject.SubjectSegmentation;
import com.google.mlkit.vision.segmentation.subject.SubjectSegmenter;
import com.google.mlkit.vision.segmentation.subject.SubjectSegmenterOptions;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class StickerProcessorModule extends ReactContextBaseJavaModule {
    
    private final ReactApplicationContext reactContext;
    private final SubjectSegmenter segmenter;

    public StickerProcessorModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        
        SubjectSegmenterOptions options = new SubjectSegmenterOptions.Builder()
            .enableForegroundBitmap()
            .enableForegroundConfidenceMask()
            .build();
            
        this.segmenter = SubjectSegmentation.getClient(options);
    }

    @NonNull
    @Override
    public String getName() {
        return "StickerProcessor";
    }

    @ReactMethod
    public void processSticker(String imageUriStr, Promise promise) {
        processStickerWithRetry(imageUriStr, promise, 0);
    }

    private void processStickerWithRetry(String imageUriStr, Promise promise, int retryCount) {
        try {
            Uri imageUri = Uri.parse(imageUriStr);
            final Bitmap[] sourceBitmap = new Bitmap[1];
            
            InputStream is = null;
            if (imageUriStr.startsWith("file://") || imageUriStr.startsWith("content://")) {
                is = reactContext.getContentResolver().openInputStream(imageUri);
            } else {
                is = new java.io.FileInputStream(imageUriStr);
            }

            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inJustDecodeBounds = true;
            BitmapFactory.decodeStream(is, null, options);
            if (is != null) is.close();

            options.inSampleSize = 1;
            while (options.outWidth / options.inSampleSize > 800 || options.outHeight / options.inSampleSize > 800) {
                options.inSampleSize *= 2;
            }

            options.inJustDecodeBounds = false;
            if (imageUriStr.startsWith("file://") || imageUriStr.startsWith("content://")) {
                is = reactContext.getContentResolver().openInputStream(imageUri);
            } else {
                is = new java.io.FileInputStream(imageUriStr);
            }
            
            sourceBitmap[0] = BitmapFactory.decodeStream(is, null, options);
            if (is != null) is.close();

            if (sourceBitmap[0] == null) {
                promise.reject("DECODE_ERROR", "Could not decode image at path: " + imageUriStr);
                return;
            }

            InputImage image = InputImage.fromBitmap(sourceBitmap[0], 0);

            segmenter.process(image)
                .addOnSuccessListener(result -> {
                    try {
                        Bitmap foregroundBitmap = result.getForegroundBitmap();
                        if (foregroundBitmap == null) {
                            promise.reject("PROCESS_ERROR", "Could not extract foreground from image");
                        } else {
                            try {
                                File cacheDir = reactContext.getCacheDir();
                                File outFile = new File(cacheDir, "sticker_" + System.currentTimeMillis() + ".png");
                                FileOutputStream out = new FileOutputStream(outFile);
                                foregroundBitmap.compress(Bitmap.CompressFormat.PNG, 100, out);
                                out.flush();
                                out.close();
                                
                                promise.resolve("file://" + outFile.getAbsolutePath());
                            } catch (IOException e) {
                                promise.reject("FILE_ERROR", "Could not save transparent sticker: " + e.getMessage());
                            } finally {
                                if (!foregroundBitmap.isRecycled()) {
                                    foregroundBitmap.recycle();
                                }
                            }
                        }
                    } finally {
                        if (sourceBitmap[0] != null && !sourceBitmap[0].isRecycled()) {
                            sourceBitmap[0].recycle();
                            sourceBitmap[0] = null;
                        }
                    }
                })
                .addOnFailureListener(e -> {
                    if (sourceBitmap[0] != null && !sourceBitmap[0].isRecycled()) {
                        sourceBitmap[0].recycle();
                        sourceBitmap[0] = null;
                    }

                    String errorMsg = e.getMessage() != null ? e.getMessage() : "";

                    if (errorMsg.toLowerCase().contains("waiting") || errorMsg.toLowerCase().contains("optional module")) {
                        if (retryCount < 5) {
                            new Handler(Looper.getMainLooper()).postDelayed(() -> {
                                processStickerWithRetry(imageUriStr, promise, retryCount + 1);
                            }, 3000);
                        } else {
                            promise.reject("MLKIT_NOT_READY", 
                                "AI model is still downloading. Please try again in a moment.");
                        }
                    } else {
                        promise.reject("MLKIT_ERROR", "Error processing image: " + errorMsg);
                    }
                });

        } catch (Exception e) {
            promise.reject("GENERAL_ERROR", e.getMessage());
        }
    }
}