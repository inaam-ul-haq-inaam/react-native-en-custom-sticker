#import "EnCustomStickerView.h"

#import <React/RCTConversions.h>

#import <react/renderer/components/EnCustomStickerViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/EnCustomStickerViewSpec/Props.h>
#import <react/renderer/components/EnCustomStickerViewSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@implementation EnCustomStickerView {
    UIView * _view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<EnCustomStickerViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const EnCustomStickerViewProps>();
    _props = defaultProps;

    _view = [[UIView alloc] init];

    self.contentView = _view;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<EnCustomStickerViewProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<EnCustomStickerViewProps const>(props);

    if (oldViewProps.color != newViewProps.color) {
        [_view setBackgroundColor: RCTUIColorFromSharedColor(newViewProps.color)];
    }

    [super updateProps:props oldProps:oldProps];
}

@end
