export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="no-container w-screen h-screen m-0 p-0">
      {children}
    </div>
  )
}
