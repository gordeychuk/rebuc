export const getReleases = () => {
    return Promise.resolve([{id: 1, name: 'mockRelease', }]);
};

export const postRelease = (data: any) => {
    return Promise.resolve({});
};

export const putRelease = (releaseId: string, data: any) => {
    return Promise.resolve({});
};

export const deleteRelease = (releaseId: any) => {
    return Promise.resolve({});
};
