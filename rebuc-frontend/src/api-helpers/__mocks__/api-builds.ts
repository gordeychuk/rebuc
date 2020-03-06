
export const getBuilds = jest.fn(() => Promise.resolve({data: [{id: '0', name: '1.0.0'}]}));

export const getBuildsForRelease = jest.fn(() => Promise.resolve({data: [{id: '0', name: '1.0.0'}]}));

export const getBuildsWithoutRelease = jest.fn(() => Promise.resolve({data: [{id: '0', name: '1.0.0'}]}));

export const postBuilds = (data: any) => {
    return Promise.resolve({});
};

export const putBuild = (data: any) => {
    return Promise.resolve({});
};

export const deleteBuild = (data: any) => {
    return Promise.resolve({});
};

