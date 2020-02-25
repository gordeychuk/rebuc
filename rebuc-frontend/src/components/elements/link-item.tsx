import * as React from 'react';
import { Link, Route } from 'react-router-dom';

export const LinkItem = ({components: { Item }, to, ...props}: {components: any, to: any}) => {
    const componentFunction = ({ children, className }: {children: any, className: any}) => (
                        <Link className={className} to={to} style={{disabled: true}}>
                            {children}
                        </Link>
                    );
    const renderFunction = ({ location: { pathname }}: {location: any}) => (
        <Item
            component={componentFunction}
            isSelected={pathname === to}
            {...props}
        />
            );
    return (
        <Route
            render={renderFunction}
        />
    );
};
