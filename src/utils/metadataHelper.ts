import { Metadata } from 'next';

interface MetaInput {
  title: string;
  description: string;
  url: string;
  image: {
    src: string;
    alt: string;
  };
  canonical: string;
}

export const createMetadata = (data: MetaInput): Metadata => {
  return {
    title: data.title,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      url: data.url,
      images: [
        {
          url: data.image.src,
          alt: data.image.alt
        }
      ],
      type: 'website'
    },
    alternates: {
      canonical: data.canonical
    }
  };
};
