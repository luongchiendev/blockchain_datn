export function Card({ children }: { children: React.ReactNode }) {
    return <div className="bg-white shadow rounded-2xl p-4">{children}</div>;
  }
  
  export function CardContent({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  }
  