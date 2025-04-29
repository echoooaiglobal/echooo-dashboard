import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 
        text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 tracking-tight">
          Welcome to Echooo Dashboard
        </h1>
        <p className="text-lg text-gray-600 mb-8
        text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400 hover:from-pink-600 hover:to-orange-500 transition-all duration-500">
          Manage your influencers and clients with ease.
        </p>
        {/* <div className="space-x-4">
          <Link href="/discover">
            <Button>Discover</Button>
          </Link>
          <Link href="/influencers">
            <Button>Influencers</Button>
          </Link>
          <Link href="/clients">
            <Button>Clients</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
        </div> */}
      </div>
    </div>
  );
}