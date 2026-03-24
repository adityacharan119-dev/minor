function SectionTitle({ eyebrow, title, description, align = 'left' }) {
  const alignClass = align === 'center' ? 'mx-auto text-center' : '';

  return (
    <div className={`max-w-3xl space-y-4 ${alignClass}`}>
      {eyebrow ? (
        <p className="text-[11px] uppercase tracking-[0.4em] text-amber-200/80">{eyebrow}</p>
      ) : null}
      <h2 className="headline-font text-4xl font-semibold tracking-tight text-stone-100 md:text-6xl">
        {title}
      </h2>
      {description ? <p className="text-base leading-7 text-stone-400">{description}</p> : null}
    </div>
  );
}

export default SectionTitle;
