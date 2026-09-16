export default function ProductError({ error }: { error: string }) {
  return <p className="mt-8 text-sm text-red-500">{error}</p>;
}
