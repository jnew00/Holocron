export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">LocalNote</h1>
        <p className="text-muted-foreground">
          Personal, local-first encrypted note-taker with mini-kanban
        </p>
      </div>
    </main>
  );
}
