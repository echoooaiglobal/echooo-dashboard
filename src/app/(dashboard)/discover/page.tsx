import DiscoverSearch from '@/components/dashboard/campaign-funnel/discover/discover-influencers/DiscoveredInfluencers';
// import DiscoverSection from '../components/discover/filters';
export default function DiscoverPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Discover Influencers</h1>
      <DiscoverSearch />
    </div>
  );
}