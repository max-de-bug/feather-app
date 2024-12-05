"use client";
import MaxWidthWrapper from "./components/MaxWidthWrapper";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "./components/ui/button";
export default function Home() {
  return (
    <>
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="absolute left-[20%] top-[20%] h-72 w-72 rounded-full bg-blue-400 opacity-20 blur-[120px]" />
        <div className="absolute right-[30%] top-[30%] h-96 w-96 rounded-full bg-blue-500 opacity-20 blur-[120px]" />
        <div className="absolute left-[40%] bottom-[20%] h-64 w-64 rounded-full bg-indigo-400 opacity-20 blur-[120px]" />
      </div>
      <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center relative">
        <div className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-blue-100 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-blue-200 hover:bg-blue-50/50">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-sm font-medium text-blue-900">
              Feather is now available
            </p>
          </div>
        </div>
        <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-500">
          Transform Documents
          <br />
          <span className="text-slate-800">Into Conversations</span>
        </h1>
        <p className="mb-8 mt-6 max-w-prose text-lg text-slate-600 sm:text-xl">
          Experience a new way to interact with your PDFs. Powered by advanced
          AI for seamless document conversations.
        </p>
        <Link
          className={buttonVariants({
            size: "lg",
            className:
              "rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all duration-300 hover:shadow-blue-200/50 hover:shadow-xl",
          })}
          href="/dashboard"
          target="_blank"
        >
          Get started for free <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </MaxWidthWrapper>
      <div className="relative isolate">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-11rem)] aspect-[1155/670] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#0061ff] to-[#60efff] opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1075rem]"
          />
        </div>
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%+11rem)] aspect-[1155/670] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#60efff] to-[#0061ff] opacity-10 sm:left-[calc(50%+30rem)] sm:w-[72.1075rem]"
          />
        </div>
        <div className="absolute inset-0 -z-10">
          <div className="relative h-full w-full">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute h-1 w-1 rounded-full bg-blue-500/10"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `pulse ${2 + Math.random() * 4}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
        <div className="mx-auto mb-32 max-w-5xl sm:mt-56">
          <div className="mb-12 px-6 lg:px-8">
            <div className="mx-auto max-w-2xl sm:text-center">
              <h2 className="mt-2 font-bold text-4xl text-slate-800 sm:text-5xl">
                Start chatting in minutes
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Three simple steps to unlock the power of your documents
              </p>
            </div>
          </div>
          <ol className="grid grid-cols-1 gap-8 md:grid-cols-3 px-6">
            {[
              {
                title: "Create Account",
                description:
                  "Start with our free plan or choose pro for more features",
                step: "01",
              },
              {
                title: "Upload PDF",
                description: "Simply drag and drop your document",
                step: "02",
              },
              {
                title: "Start Chatting",
                description: "Get instant answers from your documents",
                step: "03",
              },
            ].map((feature, index) => (
              <li
                key={index}
                className="group relative bg-white p-8 rounded-3xl shadow-sm transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-rotate-1 border border-blue-100/20"
              >
                <div className="flex flex-col h-full">
                  <div className="mb-4 text-blue-600/30 font-bold text-6xl transition-all duration-300 group-hover:scale-150 group-hover:translate-x-3 group-hover:-translate-y-3 group-hover:opacity-20">
                    {feature.step}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600">{feature.description}</p>
                  <div className="absolute bottom-8 right-8 opacity-0 transform translate-x-8 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRight className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mt-16 flow-root sm:mt-24">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <Image
                alt="product-preview"
                src="/dashboard-preview.jpg"
                width={1364}
                height={866}
                quality={100}
                className="rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10 transition-all duration-300 hover:shadow-blue-200/20"
              />
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.4;
          }
        }

        .mesh-gradient {
          background-image: radial-gradient(
              at 40% 20%,
              hsla(212, 98%, 85%, 1) 0px,
              transparent 50%
            ),
            radial-gradient(
              at 80% 0%,
              hsla(212, 98%, 85%, 1) 0px,
              transparent 50%
            ),
            radial-gradient(
              at 0% 50%,
              hsla(212, 98%, 85%, 1) 0px,
              transparent 50%
            ),
            radial-gradient(
              at 80% 50%,
              hsla(212, 98%, 85%, 1) 0px,
              transparent 50%
            ),
            radial-gradient(
              at 0% 100%,
              hsla(212, 98%, 85%, 1) 0px,
              transparent 50%
            ),
            radial-gradient(
              at 80% 100%,
              hsla(212, 98%, 85%, 1) 0px,
              transparent 50%
            ),
            radial-gradient(
              at 0% 0%,
              hsla(212, 98%, 85%, 1) 0px,
              transparent 50%
            );
        }
      `}</style>
    </>
  );
}
