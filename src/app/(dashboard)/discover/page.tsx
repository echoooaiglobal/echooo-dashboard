import DiscoverSearch from '@/components/discover/DiscoverSearch';

export default function DiscoverPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Discover Influencers</h1>
      <DiscoverSearch />
    </div>
  );
}