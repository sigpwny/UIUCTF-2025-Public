import { navigate } from 'astro:transitions/client';
import { Api } from '@/lib/ctfd/Api';
import type {
  ChallengeListSuccessResponse,
  TeamDetailedSuccessResponse,
  TeamMembersSuccessResponse,
  TeamSolvesSuccessResponse,
  UserDetailedSuccessResponse,
  ScoreboardListSuccessResponse,
} from '@/lib/ctfd/Api';

const CTFD_BASE_URL = import.meta.env.PUBLIC_CTFD_BASE_URL;

export type Challenge = ChallengeListSuccessResponse["data"][number];
export type Team = TeamDetailedSuccessResponse["data"];
export type TeamMembers = TeamMembersSuccessResponse["data"];
export type TeamSolves = TeamSolvesSuccessResponse["data"];
export type User = UserDetailedSuccessResponse["data"];
export type ScoreboardEntry = ScoreboardListSuccessResponse["data"][number];

interface CtfdState {
  ctfd: Api<unknown>;
  isLoggedIn: boolean;
  csrfToken?: string;
  team?: Team;
  teamMembers?: TeamMembers;
  teamSolves?: TeamSolves;
  user?: User;
  challengesByCategory?: Record<string, Challenge[]>;
  selectedCategory: string | null;
  selectedChallenge: Challenge | null;
}

export const state: CtfdState = $state({
  ctfd: new Api({
    baseUrl: `${CTFD_BASE_URL}/api/v1`,
  }),
  isLoggedIn: storage_getIsLoggedIn(),
  selectedCategory: null,
  selectedChallenge: null,
});

export async function init() {
  state.ctfd = new Api({
    baseUrl: `${CTFD_BASE_URL}/api/v1`,
  });
  if (!state.isLoggedIn) {
    state.isLoggedIn = storage_getIsLoggedIn();
  }
  await refreshCsrfToken();
}

export async function refreshCsrfToken(): Promise<string> {
  try {
    const response = await state.ctfd.auth.getCsrfToken();
    if (response.ok && response.data.csrf_token) {
      state.csrfToken = response.data.csrf_token;
      return state.csrfToken;
    } else {
      console.error("Failed to fetch CSRF token");
      return "";
    }
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    return "";
  }
}

export async function getCsrfToken(): Promise<string> {
  if (typeof state.csrfToken === "undefined") {
    state.csrfToken = await refreshCsrfToken();
  }
  return state.csrfToken;
}

// Local storage helpers
function storage_getIsLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem("ctfd_isLoggedIn");
  return stored === "true";
}
function storage_setIsLoggedIn(isLoggedIn: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem("ctfd_isLoggedIn", isLoggedIn.toString());
}

// Updates login status if we can't call /api/v1/users/me
export async function updateIsLoggedIn(): Promise<boolean> {
  if (state.isLoggedIn === false) return false;
  state.ctfd.users.getUserPrivate()
    .then(response => {
      if (response.ok && response.data.success) {
        setIsLoggedIn(true);
      }
    })
    .catch(response => {
      setIsLoggedIn(false);
      if (!(response.status === 401 || response.status === 403)) {
        throw new Error("Failed to connect to CTFd");
      }
    });
  return state.isLoggedIn;
}

export function setIsLoggedIn(isLoggedIn: boolean) {
  state.isLoggedIn = isLoggedIn;
  storage_setIsLoggedIn(isLoggedIn);
}

export async function logout() {
  state.ctfd.auth.getLogout({
    baseUrl: `${CTFD_BASE_URL}`,
  })
    .then(async () => {
      await updateIsLoggedIn();
    })
    .catch(error => {
      console.error("Failed to log out:", error);
    });
}

export function handleCtfdRedirect(redirect: string) {
  switch (redirect) {
    case "auth.confirm":
      navigate("/confirm");
      break;
    case "auth.login":
      navigate("/login");
      break;
    case "challenges.listing":
      navigate("/missions");
      break;
    case "teams.private":
      navigate("/profile");
      break;
    case "views.settings":
      navigate("/profile");
      break;
    case "views.static_html":
      navigate("/");
      break;
    default:
      console.warn(`Unhandled redirect: ${redirect}`);
      break;
  }
}

export function refreshTeam() {
  return state.ctfd.teams.getTeamPrivate()
    .then(response => {
      if (response.ok && response.data.success) {
        state.team = response.data.data;
      } else {
        console.error("Failed to refresh team data");
      }
    });
}

export function refreshTeamMembers() {
  return state.ctfd.teams.getTeamPrivateMembers()
    .then(response => {
      if (response.ok && response.data.success) {
        state.teamMembers = response.data.data;
      } else {
        console.error("Failed to refresh team members data");
      }
    });
}

export function refreshTeamSolves() {
  return state.ctfd.teams.getTeamPrivateSolves()
    .then(response => {
      if (response.ok && response.data.success) {
        state.teamSolves = response.data.data;
      } else {
        console.error("Failed to refresh team solves data");
      }
    });
}

export function refreshUser() {
  return state.ctfd.users.getUserPrivate()
    .then(response => {
      if (response.ok && response.data.success) {
        state.user = response.data.data;
      } else {
        console.error("Failed to refresh user data");
      }
    });
}

export function getCountChallenges(): number {
  if (!state.challengesByCategory) return 0;
  return Object.values(state.challengesByCategory).reduce(
    (count, challenges) => count + challenges.length,
    0
  );
}

// TODO: Remove
export function randomlySetChallengesSolved() {
  if (!state.challengesByCategory) return;
  Object.values(state.challengesByCategory).forEach((challenges) => {
    challenges.forEach((challenge) => {
      if (Math.random() < 0.5) {
        challenge.solved_by_me = true; // Simulate solving the challenge
      }
    });
  });
}