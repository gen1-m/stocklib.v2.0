export default function Home() {
  return (
    <div> 
      {/* --- HOME PAGE --- */}
      {/* Title */}
      <h1 className="text-4xl font-bold text-center py-10">
        StockLib
      </h1>
      {/* Description */}
      <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto">
        StockLib is a full-stack market intelligence platform for stocks, crypto, news, watchlists, and AI-assisted research.
      </p>
      {/* Widgets */}
      
      <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-10">
        {/* Widget 1 */}
        <div className="bg-surface p-20 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Widget 1</h2>
          <p className="text-muted-foreground">
            This is a simple widget for displaying information.
          </p>
        </div>
        {/* Widget 2 */}
        <div className="bg-surface p-20 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Widget 2</h2>
          <p className="text-muted-foreground">
            This is another simple widget for displaying information.
          </p>
        </div>
        {/* Widget 3 */}
        <div className="bg-surface p-20 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Widget 3</h2>
          <p className="text-muted-foreground">
            This is a third simple widget for displaying information.
          </p>
        </div>{/* Widget 4 */}
        <div className="bg-surface p-20 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Widget 4</h2>
          <p className="text-muted-foreground">
            This is a fourth simple widget for displaying information.
          </p>
        </div>
      </div>

      </div>
    </div>
  );
}
