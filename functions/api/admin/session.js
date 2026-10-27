// Reaching this handler means the admin middleware accepted the token.
export const onRequestGet = (context) => Response.json({ email: context.data.adminEmail });
