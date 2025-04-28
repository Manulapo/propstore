import React from "react";

const Heading = ({
  icon,
  title,
}: {
  icon?: React.ReactElement;
  title?: string;
}) => {
  return (
    <div className="flex gap-2 items-center mb-4">
      {icon && React.cloneElement(icon)}
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
    </div>
  );
};

export default Heading;
