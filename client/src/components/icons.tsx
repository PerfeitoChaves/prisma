import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

function Svg({ children, ...p }: P) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...p}
    >
      {children}
    </svg>
  );
}

export const INewspaper = (p: P) => (
  <Svg {...p}>
    <path d="M15 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H19a1 1 0 0 0 1-1V8.5L15 4Z" />
    <path d="M15 4v4.5h4.5" />
    <path d="M7.5 8.5H11M7.5 12h8M7.5 15.5h8" />
  </Svg>
);

export const ICompare = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="4.5" width="7.6" height="15" rx="1.2" />
    <rect x="12.9" y="4.5" width="7.6" height="15" rx="1.2" />
    <path d="M9.6 9h4.8M12.9 7.4l1.6 1.6-1.6 1.6M14.4 15H9.6M11.1 13.4 9.5 15l1.6 1.6" />
  </Svg>
);

export const ISearch = (p: P) => (
  <Svg {...p}>
    <circle cx="10.5" cy="10.5" r="6.2" />
    <path d="m20 20-4.9-4.9" />
  </Svg>
);

export const IBookmark = ({ filled, ...p }: P & { filled?: boolean }) => (
  <Svg {...p}>
    <path
      d="M7 4.5h10a.9.9 0 0 1 .9.9V20l-5.9-3.7L6.1 20V5.4a.9.9 0 0 1 .9-.9Z"
      fill={filled ? "currentColor" : "none"}
    />
  </Svg>
);

export const ITarget = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="7.6" />
    <circle cx="12" cy="12" r="3.4" />
    <path d="M12 2.2V4.6M12 19.4v2.4M2.2 12h2.4M19.4 12h2.4" />
  </Svg>
);

export const IBolt = (p: P) => (
  <Svg {...p}>
    <path d="M13.2 2.8 5.4 13.4h5l-1.4 7.8 7.8-10.6h-5l1.4-7.8Z" />
  </Svg>
);

export const IEye = (p: P) => (
  <Svg {...p}>
    <path d="M2.6 12S6.2 5.9 12 5.9 21.4 12 21.4 12 17.8 18.1 12 18.1 2.6 12 2.6 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const IArrowLeft = (p: P) => (
  <Svg {...p}>
    <path d="M19 12H5m0 0 5-5m-5 5 5 5" />
  </Svg>
);

export const IExternal = (p: P) => (
  <Svg {...p}>
    <path d="M14 4.5h5.5V10" />
    <path d="M19.2 4.8 11 13" />
    <path d="M19.5 13.5V18a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V6A1.5 1.5 0 0 1 6 4.5h4.5" />
  </Svg>
);

export const IClose = (p: P) => (
  <Svg {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Svg>
);

export const ICheck = (p: P) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);

export const ISlash = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="m6.5 6.5 11 11" />
  </Svg>
);

export const IClock = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 7.4V12l3 2" />
  </Svg>
);

export const IDoc = (p: P) => (
  <Svg {...p}>
    <path d="M6.5 4A1.5 1.5 0 0 1 8 2.5h5.5L18 7v12.5a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 7 19.5v-15Z" />
    <path d="M13 2.5V7h4.5" />
    <path d="M9.5 12h5M9.5 15.5h5" />
  </Svg>
);

export const IQuote = (p: P) => (
  <Svg {...p}>
    <path d="M10.2 7.4C7.3 8.2 5.8 10.1 5.8 13v3.9h4.8v-5H7.9c.1-1.4 1-2.4 2.7-2.9v-2.6Z" fill="currentColor" stroke="none" />
    <path d="M18.7 7.4c-2.9.8-4.4 2.7-4.4 5.6v3.9h4.8v-5h-2.7c.1-1.4 1-2.4 2.7-2.9V7.4Z" fill="currentColor" stroke="none" />
  </Svg>
);

export const ITrash = (p: P) => (
  <Svg {...p}>
    <path d="M5 7h14M9.6 7V5.2a1 1 0 0 1 1-1h2.8a1 1 0 0 1 1 1V7" />
    <path d="m7.8 7 .6 11.6a1.5 1.5 0 0 0 1.5 1.4h4.2a1.5 1.5 0 0 0 1.5-1.4L16.2 7" />
    <path d="M10.2 10.8v6.4M13.8 10.8v6.4" />
  </Svg>
);

export const IReader = (p: P) => (
  <Svg {...p}>
    <path d="M12 6.4C10.4 4.9 8.3 4.2 5.5 4.2c-.8 0-1.5.1-2.3.3v14.3c.8-.2 1.5-.3 2.3-.3 2.8 0 4.9.7 6.5 2.2 1.6-1.5 3.7-2.2 6.5-2.2.8 0 1.5.1 2.3.3V4.5c-.8-.2-1.5-.3-2.3-.3-2.8 0-4.9.7-6.5 2.2Z" />
    <path d="M12 6.4v14.3" />
  </Svg>
);
