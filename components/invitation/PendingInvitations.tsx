import { Card, Error, LetterAvatar, Loading } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { Invitation, Team } from '@prisma/client';
import useInvitations from 'hooks/useInvitations';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import ConfirmationDialog from '../shared/ConfirmationDialog';

const PendingInvitations = ({ team }: { team: Team }) => {
  const [selectedInvitation, setSelectedInvitation] =
    useState<Invitation | null>(null);

  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);

  const { isLoading, isError, invitations, mutateInvitation } = useInvitations(
    team.slug
  );

  const { t } = useTranslation('common');

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  const deleteInvitation = async (invitation: Invitation | null) => {
    if (!invitation) return;

    const sp = new URLSearchParams({ id: invitation.id });

    const response = await fetch(
      `/api/teams/${team.slug}/invitations?${sp.toString()}`,
      {
        method: 'DELETE',
        headers: defaultHeaders,
      }
    );

    const json = (await response.json()) as ApiResponse<unknown>;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    mutateInvitation();
    toast.success(t('invitation-deleted'));
  };

  if (!invitations || !invitations.length) {
    return null;
  }

  return (
    <>
      <Card heading="Invitations Sent">
        <Card.Body>
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3" colSpan={2}>
                  {t('email')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('role')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('created-at')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('action')}
                </th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((invitation) => {
                return (
                  <tr
                    key={invitation.token}
                    className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-3" colSpan={2}>
                      <div className="flex items-center justify-start space-x-2">
                        <LetterAvatar name={invitation.email} />
                        <span>{invitation.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">{invitation.role}</td>
                    <td className="px-6 py-3">
                      {new Date(invitation.createdAt).toDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <Button
                        size="xs"
                        color="error"
                        variant="outline"
                        onClick={() => {
                          setSelectedInvitation(invitation);
                          setConfirmationDialogVisible(true);
                        }}
                      >
                        {t('remove')}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card.Body>
      </Card>
      <ConfirmationDialog
        visible={confirmationDialogVisible}
        onCancel={() => setConfirmationDialogVisible(false)}
        onConfirm={() => deleteInvitation(selectedInvitation)}
        title={t('confirm-delete-member-invitation')}
      >
        {t('delete-member-invitation-warning')}
      </ConfirmationDialog>
    </>
  );
};

export default PendingInvitations;
