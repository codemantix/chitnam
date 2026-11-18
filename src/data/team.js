/**
 * Team members.
 *
 * Names, roles and portraits are from the old About page (client-owned
 * photos). Published at the client developer's request to match the old
 * site; the client should still confirm roles are current. Set
 * `published: false` to hide anyone who has left or withdrawn consent.
 */
export const team = [
  {
    name: "Ruth I. Badiru",
    role: "Head of Information and Communications",
    photo: "/images/team/ruth-badiru.jpg",
    published: true,
  },
  {
    name: "Chris B. Nwibor",
    role: "Head of Operations",
    photo: "/images/team/chris-nwibor.jpg",
    published: true,
  },
  {
    name: "Ruth T. Adamu",
    role: "Head of Recruitment and Admissions",
    photo: "/images/team/ruth-adamu.jpg",
    published: true,
  },
];

export const publishedTeam = team.filter((member) => member.published);
