import heroImage from '@/assets/hero-tacos.jpg';

export const HeroSection = () => {
  return (
    <section className="relative h-56 md:h-72 overflow-hidden">
      <img
        src={heroImage}
        alt="Deliciosos tacos al pastor"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
          Auténtico Sabor
          <br />
          <span className="text-primary">Mexicano</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Tacos artesanales hechos con amor 🔥
        </p>
      </div>
    </section>
  );
};
