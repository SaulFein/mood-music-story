import { RequestHandler } from '@builder.io/qwik-city';

// In a real application, you would store results in a database
// For now, we'll use an in-memory store
const resultStore = new Map();

export const onGet: RequestHandler = async ({ params, json }) => {
  const { id } = params;
  
  const result = resultStore.get(id);
  
  if (!result) {
    json(404, { error: 'Result not found' });
    return;
  }
  
  json(200, result);
};
