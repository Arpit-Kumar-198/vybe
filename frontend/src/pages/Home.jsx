import Feed from "./Feed";
import RightSidebar from "./RightSidebar";

const Home = () => {
  return (
    <div className="flex w-full">
      {/* Main feed */}
      <main className="min-w-0 flex-1">
        <Feed />
      </main>

      {/* Right sidebar */}
      <aside className="hidden w-80 shrink-0 lg:block">
        <RightSidebar />
      </aside>
    </div>
  );
};

export default Home;
