import React, {useState} from 'react';
import Button from '@atlaskit/button';
import ModalDialog, { ModalFooter, ModalTransition } from '@atlaskit/modal-dialog';


interface IFooterProps {
    onClose: any;
    showKeyline: boolean;
}

interface IConfirmationModalProps {
    callback: any;
    heading: string;
    trigger: any;
    description: string;
    refresher: any;
}

export const ConfirmationModal = (props: IConfirmationModalProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    const callbackWithCloseAndRefresh = () => {
        props.callback();
        setIsOpen(false);
        if (props.refresher) {
            setTimeout(() => props.refresher(), 100);
        }

    };

    const footer: React.ElementType = (props: IFooterProps) => (
        <ModalFooter showKeyline={props.showKeyline}>
            <span />
            <span>
                <Button data-cy='confirmModal' appearance='primary' onClick={callbackWithCloseAndRefresh}>
                    Yes
                </Button>
                <Button data-cy='cancelModal' appearance='subtle' onClick={close}>
                    No
                </Button>
            </span>
        </ModalFooter>
    );

    return (
        <span>
            <span onClick={open}>
                {props.trigger}
            </span>

            <ModalTransition>
                {isOpen && (
                    <ModalDialog
                        onClose={close}
                        heading={props.heading}
                        width='small'
                        components={{
                            Footer: footer,
                        }}
                    >
                        <div>
                            {props.description}
                        </div>
                    </ModalDialog>
                )}
            </ModalTransition>
        </span>
    );
};

