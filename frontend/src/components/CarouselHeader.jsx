import { useState, useEffect, useRef } from 'react';

const images = [
  'https://i.imgur.com/4u8iz2q.jpeg',
  'https://i.imgur.com/VbSVxW6.jpeg',
  '/carrusel3.jpg'
];

const texts = [
  '¡Encuentra tu compañero ideal!',
  'Adoptar salva vidas.',
  'Conectando corazones humanos y animales.'
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
              <h2>{texts[i]}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}