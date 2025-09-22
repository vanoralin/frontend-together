interface TripListCardProps {
  title: string;
  image: string;
  bgColor: string;
}

export default function TripListCard({ title, image, bgColor }: TripListCardProps) {
  return (
    <div
      className={`flex-1 rounded-xl shadow-md p-4 bg-gradient-to-b ${bgColor} flex flex-col items-center justify-center`}
    >
      <img src={image} alt={title} className="w-16 h-16 mb-2" />
      <p className="text-sm font-medium text-gray-700">{title}</p>
    </div>
  );
}
