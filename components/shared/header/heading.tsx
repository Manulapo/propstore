const Heading = ({
  icon,
  title,
}: {
  icon?: React.ReactNode;
  title?: string;
}) => {
  return (
    <div className="flex gap-2 items-center mb-4">
      {icon}
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
    </div>
  );
};

export default Heading;
