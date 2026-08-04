declare module '*.css';

declare module 'serialize-error' {
  export function serializeError(err: any): any;
}

declare module 'html-to-image' {
  export function toPng(node: Node | HTMLElement, options?: any): Promise<string>;
}

declare module '@react-aria/button' {
  export function useButton(props: any, ref?: any): { buttonProps: any };
}

declare module 'sonner' {
  export const Toaster: any;
  export const toast: any;
}

declare module '@auth/create/react' {
  export const SessionProvider: any;
}

declare module '@/__create/fetch' {
  const fetch: any;
  export default fetch;
}

declare module 'react-router' {
  import { ComponentType } from 'react';
  export const Links: ComponentType<any>;
  export const Meta: ComponentType<any>;
  export const Outlet: ComponentType<any>;
  export const Scripts: ComponentType<any>;
  export const ScrollRestoration: ComponentType<any>;
  export function useAsyncError(): any;
  export function useLocation(): any;
  export function useRouteError(): any;
  export function useNavigate(): any;
}

declare module '@/components/*' {
  const value: any;
  export default value;
}

declare module '@/utils/*' {
  const value: any;
  export default value;
}

interface ImportMetaEnv {
  readonly DEV?: boolean;
  readonly PROD?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: any;
}
import 'react-router';
module 'virtual:load-fonts.jsx' {
	export function LoadFonts(): null;
}
declare module 'react-router' {
	interface AppLoadContext {
		// add context properties here
	}
}
declare module 'npm:stripe' {
	import Stripe from 'stripe';
	export default Stripe;
}
declare module '@auth/create/react' {
	import { SessionProvider } from '@auth/react';
	export { SessionProvider };
}
