import {
  DEFAULT_ADMIN,
  DEFAULT_PROVIDER,
  DEFAULT_SEEKER,
} from "@/lib/prototype-types";

export type DevCredentials = {
  admin: { phone: string; password: string };
  provider: { phone: string; password: string };
  seeker: { phone: string; password: string };
};

const DEMO: DevCredentials = {
  admin: {
    phone: DEFAULT_ADMIN.phone,
    password: DEFAULT_ADMIN.password,
  },
  provider: {
    phone: DEFAULT_PROVIDER.phone,
    password: DEFAULT_PROVIDER.password,
  },
  seeker: {
    phone: DEFAULT_SEEKER.phone,
    password: DEFAULT_SEEKER.password,
  },
};

export function getDevAdminCredentials() {
  return DEMO.admin;
}

export function getDevProviderCredentials() {
  return DEMO.provider;
}

export function getDevSeekerCredentials() {
  return DEMO.seeker;
}
