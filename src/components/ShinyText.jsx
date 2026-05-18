import React from 'react';

const ShinyText = ({
  text,
  disabled = false,
  speed = 3,
  className = '',
  style = {}
}) => {
  if (disabled) {
    return <span className={className} style={style}>{text}</span>;
  }

  const animationDuration = `${speed}s`;

  return (
    <span
      className={`shiny-text ${className}`}
      style={{
        animationDuration,
        ...style
      }}
    >
      {text}
    </span>
  );
};

export default ShinyText;
