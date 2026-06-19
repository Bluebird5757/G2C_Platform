export const ROLES = {
  CONSUMER: 'consumer',
  GROWER: 'grower',
};

export const TOKEN_KEY = 'g2c_token';

export const getErrorMessage = (error) => {
  return error.response?.data?.message || error.message || 'Something went wrong';
};
