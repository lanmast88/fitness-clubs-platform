import { useState } from "react";
import Header from "../components/Header";
import { posts } from "../components/newsCards";

function News() {
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <>
      <div className="min-h-screen bg-[#0A0B10] text-slate-100">
        <Header />

        <section className="bg-[#0A0B10] pt-8 pb-12 min-h-screen">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                Блог
              </p>
              <h1 className="mt-2 text-4xl font-bold text-white">
                Новости Stack Fitness
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Будьте в курсе последних событий нашего фитнес-сообщества.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="flex flex-col items-start cursor-pointer transition-transform hover:scale-[1.02]"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="relative w-full">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="aspect-[16/9] w-full rounded-2xl bg-gray-800 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                    />
                  </div>
                  <div className="max-w-xl">
                    <div className="mt-8 flex items-center gap-x-4 text-xs">
                      <time className="text-gray-500">{post.date}</time>
                      <span className="rounded-full bg-[#9D50BB] px-3 py-1.5 text-white shadow-[0_0_18px_rgba(157,80,187,0.45)] transition hover:shadow-[0_0_26px_rgba(157,80,187,0.6)]">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold leading-6 text-white">
                      {post.title}
                    </h3>
                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-400">
                      {post.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* --- MODAL SECTION --- */}
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedPost(null)}
            />

            <div className="relative w-full max-w-5xl max-h-[85vh] overflow-y-auto rounded-3xl bg-gray-900 border border-white/10 shadow-2xl">
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-6 right-6 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-white/10 transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2">
                  <img
                    src={selectedPost.imageUrl}
                    className="h-full w-full object-cover min-h-[300px]"
                    alt={selectedPost.title}
                  />
                </div>

                <div className="p-8 lg:p-12 lg:w-1/2 flex flex-col justify-center">
                  <span className="text-blue-400 font-semibold tracking-wider text-sm uppercase">
                    {selectedPost.category}
                  </span>
                  <h2 className="mt-4 text-3xl font-bold text-white leading-tight">
                    {selectedPost.title}
                  </h2>
                  <div className="mt-6 text-gray-300 leading-relaxed text-lg">
                    {selectedPost.description}

                    <p className="mt-4">
                      In this article, we dive deeper into how Stack Fitness can
                      help you reach your goals. Consistency is key, and our
                      community is here to support you every step of the way.
                    </p>
                  </div>

                  <div className="mt-10 flex items-center gap-4 border-t border-white/10 pt-8">
                    <img
                      src={selectedPost.author.imageUrl}
                      className="h-12 w-12 rounded-full"
                      alt=""
                    />
                    <div>
                      <p className="font-bold text-white">
                        {selectedPost.author.name}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {selectedPost.author.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="border-t border-white/10 bg-slate-900/70">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-400 text-center">
            <p>© 2026 Stack Fitness</p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default News;
