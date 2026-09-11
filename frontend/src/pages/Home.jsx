import Feed from "./Feed";
import RightSidebar from "./RightSidebar";
import useGetAllPosts from "@/hooks/useGetAllPosts.js";

const Home = () => {
  useGetAllPosts();

  return (
    <div className="flex w-full min-w-0">
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
