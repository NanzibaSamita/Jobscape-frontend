type Routes = {
  id: number;
  route: string;
  authOnly: boolean;
  availableFor: string[];
};

const routes: Routes[] = [
  // ✅ Jobseeker area
  {
    id: 1,
    route: "/jobseeker",
    authOnly: true,
    availableFor: ["job-seeker"],
  },
  {
    id: 2,
    route: "/jobseeker/profile",
    authOnly: true,
    availableFor: ["job-seeker"],
  },

  // ✅ Hiring area
  {
    id: 3,
    route: "/profile",
    authOnly: true,
    availableFor: ["hiring"],
  },

  // Optional: dashboard per-role
  {
    id: 4,
    route: "/dashboard",
    authOnly: true,
    availableFor: ["job-seeker", "hiring", "base"],
  },

  // Public jobs page (or protected if you want)
  {
    id: 5,
    route: "/jobs",
    authOnly: false,
    availableFor: [],
  },
];

export default routes;
