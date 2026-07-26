import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">Godteck</h3>
            <p className="text-sm mt-1">Professional Maintenance & Engineering Services</p>
          </div>
          <div className="flex flex-col gap-1 sm:text-right text-sm">
            <p>Email: <a href="mailto:info@godteck.com" className="hover:underline hover:text-zinc-900 dark:hover:text-zinc-100">info@godteck.com</a></p>
            <p>Phone: <a href="tel:+1234567890" className="hover:underline hover:text-zinc-900 dark:hover:text-zinc-100">+1 (234) 567-890</a></p>
            <p>Address: Lagos, Nigeria</p>
          </div>
        </div>
        <div className="mt-8 border-t border-zinc-200 pt-6 text-center text-xs dark:border-zinc-800">
          <p>&copy; {new Date().getFullYear()} Godteck. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
