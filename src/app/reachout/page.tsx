import Link from 'next/link';


export default function ReachOutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linkedin-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg border-2 border-black shadow-brutal">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center">
          Let's Connect!
        </h1>
        <div className="flex justify-center mb-4">   
            <img src="/me.jpeg" alt="Siddhartha Upase" className="w-32 h-32 rounded-full border-4 border-black shadow-lg" />
        </div>
        <p className="text-center text-zinc-700">
          Got questions? Or just want to share your favorite dad joke? I'm all ears! Feel free to reach out!
        </p>
        <div className="flex flex-col items-center">
          <p className="text-lg font-bold text-zinc-800">Drop me an Email:</p>
          <a href="mailto:supase@hawk.iit.edu" className="text-blue-600 hover:underline">
            supase@hawk.iit.edu
          </a>
          <p className="text-lg font-bold text-zinc-800 mt-4">Connect on LinkedIn:</p>
          <Link href="https://www.linkedin.com/in/siddhartha-upase-a6963617a/" className="text-blue-600 hover:underline">
            https://www.linkedin.com/in/siddhartha-upase-a6963617a/
          </Link>
        </div>
      </div>
    </div>
  );
}
