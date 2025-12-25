type Routes = {
    id: number;
    route: string;
    authOnly: boolean;
    availableFor: string[];
};

const routes: Routes[] = [
    {
        id: 0,
        route: "/dashboard",
        authOnly: false,
        availableFor: ["95"],
    },
    {
        id: 0,
        route: "/jobs",
        authOnly: true,
        availableFor: [],
    }
];

export default routes;


