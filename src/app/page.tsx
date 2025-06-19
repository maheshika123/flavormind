import IngredientClientPage from "@/components/home/IngredientClientPage";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center py-8 md:py-12">
      <header className="text-center mb-10 md:mb-12 animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-headline font-extrabold text-primary">
          FlavorMind
        </h1>
        <p className="mt-3 text-lg md:text-xl text-foreground/80">
          Turn your fridge contents into delightful meals!
        </p>
      </header>
      <IngredientClientPage />
    </div>
  );
}
