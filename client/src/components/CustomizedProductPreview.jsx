function CustomizedProductPreview({
  imageSrc,
  productName,
  customization = null,
  className = '',
  imageClassName = '',
  priority = 'full',
}) {
  const hasText = Boolean(customization?.text?.trim());
  const hasOverlayImage = Boolean(customization?.imageSrc);
  const textStyle =
    priority === 'compact'
      ? { fontSize: '12px', padding: '2px 6px', letterSpacing: '0.08em' }
      : { fontSize: '24px', padding: '6px 12px', letterSpacing: '0.12em' };
  const overlayWidth = priority === 'compact' ? '28%' : '34%';

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img src={imageSrc} alt={productName} className={imageClassName} />

      {hasText ? (
        <div
          className="pointer-events-none absolute rounded-full bg-black/45 font-semibold uppercase text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm whitespace-pre-wrap"
          style={{
            left: `${customization.textPosition?.x ?? 50}%`,
            top: `${customization.textPosition?.y ?? 50}%`,
            transform: 'translate(-50%, -50%)',
            color: customization.textColor || '#ffffff',
            ...textStyle,
          }}
        >
          {customization.text}
        </div>
      ) : null}

      {hasOverlayImage ? (
        <img
          src={customization.imageSrc}
          alt={`${productName} customized artwork`}
          className="pointer-events-none absolute object-contain drop-shadow-[0_14px_34px_rgba(0,0,0,0.4)]"
          style={{
            left: `${customization.imagePosition?.x ?? 50}%`,
            top: `${customization.imagePosition?.y ?? 50}%`,
            width: overlayWidth,
            transform: `translate(-50%, -50%) scale(${customization.imageScale ?? 1})`,
          }}
        />
      ) : null}
    </div>
  );
}

export default CustomizedProductPreview;
