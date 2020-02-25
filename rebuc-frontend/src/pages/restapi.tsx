import React, { useEffect } from 'react';
import { withNavigationViewController } from '@atlaskit/navigation-next';
import {releasesView} from '../views/releases-view';
import Helmet from 'react-helmet';
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

interface IApiRouteBaseProps {
    navigationViewController: any;
}
const DisableTryItOutPlugin = function() {
  return {
    statePlugins: {
      spec: {
        wrapSelectors: {
          allowTryItOutFor: () => () => false
        }
      }
    }
  }
};



const ApiRouteBase = (props: IApiRouteBaseProps) => {
    useEffect(() => {
        props.navigationViewController.setView(releasesView.id);
    }, [props.navigationViewController]);


    return (
            <div data-cy='buildsList'>
                <Helmet>
                    <title>REST API</title>
                </Helmet>
                <SwaggerUI url="/static/openapi.json" plugins={[DisableTryItOutPlugin]} />
          </div>
        );
};

export const ApiRoute = withNavigationViewController(ApiRouteBase);
