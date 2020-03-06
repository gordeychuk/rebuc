export const getReleases = () => {
    return Promise.resolve({data: [
            {id: 1, name: 'Release 1', release_date: '2020-01-01', description: 'test', builds: [],
                release_pattern: {start_build: {id: 1, name: '1.0'}, build_mask: '1.X'}}
    ] });
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
