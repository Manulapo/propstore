// using the auth file as middleware by exporting it with the alias middleware so that it can be used in the routes by nextJs
export { auth as middleware } from '@/auth';