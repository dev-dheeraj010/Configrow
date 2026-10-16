import SceneLoader from '@/components/SceneLoader';
import ScrollDirector from '@/components/ScrollDirector';
import Hero from '@/components/sections/Hero';
import Services from '@/components/sections/Services';
import PromiseSection from '@/components/sections/Promise';
import Growth from '@/components/sections/Growth';
import Enquiry from '@/components/sections/Enquiry';

/** Home: 3D scrollytelling. ScrollDirector drives the scene across #main (Hero -> Services -> Promise -> About -> Enquiry). */
export default function Home() {
  return (
    <>
      <SceneLoader />
      <ScrollDirector />
      <main id="main">
        <Hero />
        <Services />
        <PromiseSection />
        <Growth />
        <Enquiry />
      </main>
    </>
  );
}
