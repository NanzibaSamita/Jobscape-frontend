export default function Links({
  linkedin,
  github,
  portfolio,
  other_links,
}: {
  linkedin?: string | null;
  github?: string | null;
  portfolio?: string | null;
  other_links: string[];
}) {
  return (
    <div>
      {/* Section title */}
      <h2 className="text-lg font-semibold mb-3">Links</h2>

      <div className="border rounded-lg p-3 bg-white space-y-2 text-xs">
        {linkedin && (
          <div className="flex gap-2">
            <span className="text-gray-500 w-20">LinkedIn</span>
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline break-all"
            >
              {linkedin}
            </a>
          </div>
        )}

        {github && (
          <div className="flex gap-2">
            <span className="text-gray-500 w-20">GitHub</span>
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline break-all"
            >
              {github}
            </a>
          </div>
        )}

        {portfolio && (
          <div className="flex gap-2">
            <span className="text-gray-500 w-20">Portfolio</span>
            <a
              href={portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline break-all"
            >
              {portfolio}
            </a>
          </div>
        )}

        {other_links.length > 0 &&
          other_links.map((link, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-gray-500 w-20">Other</span>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline break-all"
              >
                {link}
              </a>
            </div>
          ))}
      </div>
    </div>
  );
}
