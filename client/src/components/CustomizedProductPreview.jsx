import { useMemo, useRef } from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getArtworkFilter = (effect = 'original') => {
  switch (effect) {
    case 'mono':
      return 'grayscale(1) contrast(1.05)';
    case 'warm':
      return 'sepia(0.28) saturate(1.05) hue-rotate(-8deg)';
    case 'cool':
      return 'saturate(1.08) hue-rotate(12deg)';
    case 'pop':
      return 'saturate(1.4) contrast(1.08)';
    case 'original':
    default:
      return 'none';
  }
};

function CustomizedProductPreview({
  imageSrc,
  productName,
  customization = null,
  className = '',
  imageClassName = '',
  priority = 'full',
  interactive = false,
  selectedLayer = '',
  onSelectLayer = null,
  onMoveLayer = null,
}) {
  const previewRef = useRef(null);
  const dragStateRef = useRef(null);

  const previewState = useMemo(() => {
    const fallbackImagePosition = customization?.imagePosition || { x: 50, y: 46 };
    const fallbackImageScale = customization?.imageScale ?? 1;

    return {
      text: customization?.text || '',
      textColor: customization?.textColor || '#ffffff',
      textPosition: customization?.textPosition || { x: 50, y: 72 },
      textSize: customization?.textSize ?? (priority === 'compact' ? 18 : 34),
      imageSrc: customization?.imageSrc || '',
      imageFrame: customization?.imageFrame || {
        x: fallbackImagePosition.x,
        y: fallbackImagePosition.y,
        width: priority === 'compact' ? 30 : 34,
        height: priority === 'compact' ? 30 : 34,
        radius: 16,
      },
      imageCrop: customization?.imageCrop || {
        x: 0,
        y: 0,
        zoom: fallbackImageScale,
      },
      artworkEffect: customization?.artworkEffect || 'original',
      artworkBorderColor: customization?.artworkBorderColor || '#ffffff',
    };
  }, [customization, priority]);

  const handleLayerPointerDown = (layer, event) => {
    if (!interactive || !previewRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const rect = previewRef.current.getBoundingClientRect();
    const pointerX = ((event.clientX - rect.left) / rect.width) * 100;
    const pointerY = ((event.clientY - rect.top) / rect.height) * 100;
    const startPosition =
      layer === 'image' ? previewState.imageFrame : previewState.textPosition;

    dragStateRef.current = {
      layer,
      origin: { x: pointerX, y: pointerY },
      startPosition: { x: startPosition.x, y: startPosition.y },
    };

    onSelectLayer?.(layer);
  };

  const handlePointerMove = (event) => {
    if (!interactive || !dragStateRef.current || !previewRef.current || !onMoveLayer) {
      return;
    }

    const rect = previewRef.current.getBoundingClientRect();
    const pointerX = ((event.clientX - rect.left) / rect.width) * 100;
    const pointerY = ((event.clientY - rect.top) / rect.height) * 100;
    const deltaX = pointerX - dragStateRef.current.origin.x;
    const deltaY = pointerY - dragStateRef.current.origin.y;

    onMoveLayer(dragStateRef.current.layer, {
      x: clamp(dragStateRef.current.startPosition.x + deltaX, 10, 90),
      y: clamp(dragStateRef.current.startPosition.y + deltaY, 10, 90),
    });
  };

  const endDrag = () => {
    dragStateRef.current = null;
  };

  const effectiveTextSize =
    priority === 'compact' ? Math.max(12, previewState.textSize * 0.48) : previewState.textSize;
  const effectiveRadius =
    priority === 'compact'
      ? Math.max(8, previewState.imageFrame.radius * 0.7)
      : previewState.imageFrame.radius;

  return (
    <div
      ref={previewRef}
      className={`relative overflow-hidden ${className}`}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <img src={imageSrc} alt={productName} className={imageClassName} />

      {interactive ? (
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:12%_12%] opacity-80" />
      ) : null}

      {previewState.imageSrc ? (
        <button
          type="button"
          onClick={() => onSelectLayer?.('image')}
          onPointerDown={(event) => handleLayerPointerDown('image', event)}
          className={`absolute overflow-hidden border-2 transition ${
            interactive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
          } ${selectedLayer === 'image' ? 'shadow-[0_0_0_999px_rgba(0,0,0,0.04)]' : ''}`}
          style={{
            left: `${previewState.imageFrame.x}%`,
            top: `${previewState.imageFrame.y}%`,
            width: `${previewState.imageFrame.width}%`,
            height: `${previewState.imageFrame.height}%`,
            transform: 'translate(-50%, -50%)',
            borderRadius: effectiveRadius,
            borderColor: previewState.artworkBorderColor,
            boxShadow:
              selectedLayer === 'image'
                ? `0 0 0 2px ${previewState.artworkBorderColor}, 0 24px 60px rgba(0,0,0,0.35)`
                : '0 18px 44px rgba(0,0,0,0.28)',
          }}
        >
          <img
            src={previewState.imageSrc}
            alt={`${productName} customized artwork`}
            className="h-full w-full object-cover"
            style={{
              transform: `translate(${previewState.imageCrop.x}%, ${previewState.imageCrop.y}%) scale(${previewState.imageCrop.zoom})`,
              transformOrigin: 'center',
              filter: getArtworkFilter(previewState.artworkEffect),
            }}
          />
        </button>
      ) : null}

      {previewState.text.trim() ? (
        <button
          type="button"
          onClick={() => onSelectLayer?.('text')}
          onPointerDown={(event) => handleLayerPointerDown('text', event)}
          className={`absolute rounded-full px-3 py-1 font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm transition ${
            interactive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
          }`}
          style={{
            left: `${previewState.textPosition.x}%`,
            top: `${previewState.textPosition.y}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: effectiveTextSize,
            color: previewState.textColor,
            backgroundColor: 'rgba(0,0,0,0.48)',
            border: selectedLayer === 'text' ? '2px solid rgba(255,255,255,0.55)' : '2px solid transparent',
            boxShadow: '0 14px 30px rgba(0,0,0,0.32)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {previewState.text}
        </button>
      ) : null}
    </div>
  );
}

export default CustomizedProductPreview;
