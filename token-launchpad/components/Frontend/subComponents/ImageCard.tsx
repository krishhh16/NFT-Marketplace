import Image from 'next/image';
import { Camera } from 'lucide-react';

const ImageCard = ({ url, title, author }: {url: string, title: string, author: string}) => {
  return (
    <div className="relative w-[90%] mx-auto h-[90%] rounded-lg overflow-hidden group">
      <Image
        src={url}
        alt={title}
        layout="fill"
        objectFit="cover"
        className="transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h2 className="text-white text-lg font-bold mb-1">{title}</h2>
        <div className="flex items-center">
          <Camera size={16} className="text-white mr-2" />
          <span className="text-white text-sm">{author}</span>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;