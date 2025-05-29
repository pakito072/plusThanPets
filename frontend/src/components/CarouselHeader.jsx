import { useState, useEffect, useRef } from 'react';

const images = [
  'https://i.imgur.com/4u8iz2q.jpeg',
  'https://i.imgur.com/VbSVxW6.jpeg',
  'https://i.imgur.com/vttxscc.jpeg',
  'https://i.imgur.com/8wBO8Ig.jpeg',
  'https://i.imgur.com/455Drmj.jpeg',
  'https://i.imgur.com/Z498UaJ.jpeg'
];

const texts = [
  '¡Encuentra tu compañero ideal!',
  'Adoptar salva vidas.',
  'Conectando corazones humanos y animales.',
  'Dales un hogar, gana un amigo fiel.',
  'Tu amor puede cambiar su historia.',
  'Juntos, comenzamos una nueva vida.'
];

export default function CarouselHeader() {
  const [index, setIndex] = useState(0);
  const [sliding, setSliding] = useState(false);
  const timeoutRef = useRef();

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setSliding(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % images.length);
        setSliding(false);
      }, 600); // Duración del slide
    }, 3500);
    return () => clearTimeout(timeoutRef.current);
  }, [index]);

  return (
    <div className="carousel-header">
      <div
        className={`carousel-slider${sliding ? ' sliding' : ''}`}
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((img, i) => (
          <div className="carousel-slide" key={i} style={{ backgroundImage: `url(${img})` }}>
            <div className="carousel-text">
              <h2 className="playfair-display-carousel">{texts[i]}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}