import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex space-x-4">
        <Link href="/dashboard/influencers" className="text-white">
          Influencers
        </Link>
        <Link href="/dashboard/clients" className="text-white">
          Clients
        </Link>
      </div>
    </nav>
  );
}