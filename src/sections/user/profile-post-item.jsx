
import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { fDate } from 'src/utils/format-time';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';

import { useMockedUser } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function ProfilePostItem({ post }) {
  const { user } = useMockedUser();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePostNow = () => {
    console.log('Post now:', post.id);
    handleMenuClose();
  };

  const handleSchedulePost = () => {
    console.log('Schedule post:', post.id);
    handleMenuClose();
  };

  const handleEdit = () => {
    console.log('Edit post:', post.id);
    handleMenuClose();
  };

  const handleDelete = () => {
    console.log('Delete post:', post.id);
    handleMenuClose();
  };

  // Extract image URL from metadata if available
  const getImageUrl = () => {
    // Check mediaUrls first
    if (post.mediaUrls && post.mediaUrls.length > 0) {
      return post.mediaUrls[0];
    }

    // Check post.media
    if (post.media) {
      return post.media;
    }

    // Check metadata for imageUrl
    try {
      const metadata = getMetadata();
      if (metadata.imageUrl) {
        return metadata.imageUrl;
      }
    } catch (error) {
      console.error('Failed to extract image URL:', error);
    }

    return null;
  };


  const getPostStatus = () => {
    if (post.publishedAt) return { label: 'Published', color: 'success' };
    if (post.scheduledAt) return { label: 'Scheduled', color: 'warning' };
    return { label: 'Draft', color: 'info' };
  };

  const getMetadata = () => {
    if (post.metadata) {
      try {
        return typeof post.metadata === 'string' ? JSON.parse(post.metadata) : post.metadata;
      } catch {
        return {};
      }
    }
    return {};
  };

  const renderHead = () => {
    const status = getPostStatus();

    return (
      <CardHeader
        disableTypography
        avatar={
          <Avatar src={user?.photoURL} alt={user?.displayName}>
            {user?.displayName?.charAt(0).toUpperCase()}
          </Avatar>
        }
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Link color="inherit" variant="subtitle1">
              {user?.displayName}
            </Link>
            <Box
              sx={{
                px: 0.75,
                py: 0.25,
                borderRadius: 0.5,
                bgcolor: `${status.color}.lighter`,
                typography: 'caption',
                fontWeight: 600,
                color: `${status.color}.dark`,
                textTransform: 'capitalize',
              }}
            >
              {status.label}
            </Box>
          </Box>
        }
        subheader={
          <Box sx={{ color: 'text.disabled', typography: 'caption', mt: 0.5 }}>
            {fDate(post.createdAt)}
            {post.scheduledAt && (
              <Box component="span" sx={{ ml: 1 }}>
                • Scheduled: {fDate(post.scheduledAt)}
              </Box>
            )}
          </Box>
        }
        action={
          <>
            <IconButton onClick={handleMenuOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                paper: {
                  sx: {
                    minWidth: 200,
                    boxShadow: (theme) => theme.shadows[20],
                  },
                },
              }}
            >
              <MenuList
                disablePadding
                dense
                sx={{
                  p: 1,
                  gap: 0.5,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <MenuItem
                  onClick={handlePostNow}
                  disabled={post.publishedAt || post.scheduledAt}
                  sx={{
                    borderRadius: 0.75,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Iconify icon="solar:upload-square-bold" sx={{ mr: 1.5, width: 18, height: 18 }} />
                  Post Now
                </MenuItem>

                <MenuItem
                  onClick={handleSchedulePost}
                  disabled={post.publishedAt}
                  sx={{
                    borderRadius: 0.75,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Iconify icon="solar:clock-circle-bold" sx={{ mr: 1.5, width: 18, height: 18 }} />
                  Schedule Post
                </MenuItem>

                <Divider sx={{ my: 0.5 }} />

                <MenuItem
                  onClick={handleEdit}
                  sx={{
                    borderRadius: 0.75,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Iconify icon="solar:pen-bold" sx={{ mr: 1.5, width: 18, height: 18 }} />
                  Edit
                </MenuItem>

                <MenuItem
                  onClick={handleDelete}
                  sx={{
                    borderRadius: 0.75,
                    color: 'error.main',
                    '&:hover': { bgcolor: 'error.lighter' },
                  }}
                >
                  <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1.5, width: 18, height: 18 }} />
                  Delete
                </MenuItem>
              </MenuList>
            </Popover>
          </>
        }
      />
    );
  };

  const renderPostContent = () => {
    const metadata = getMetadata();
    // Get content from metadata (it's a direct string, not an object with platform keys)
    const generatedContent = metadata.content;
    const hasContent = generatedContent || post.message || metadata.generationPrompt;

    return (
      <Stack spacing={2}>
        {/* Top Section: Platform & Status Badges */}
        <Box sx={{ px: 3, pt: 2, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {post.platform && (
            <Box
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 0.5,
                bgcolor: 'primary.lighter',
                typography: 'caption',
                fontWeight: 600,
                color: 'primary.dark',
                textTransform: 'capitalize',
              }}
            >
              📱 {post.platform}
            </Box>
          )}
          {metadata.imageStyle && (
            <Box
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 0.5,
                bgcolor: 'secondary.lighter',
                typography: 'caption',
                fontWeight: 600,
                color: 'secondary.dark',
                textTransform: 'capitalize',
              }}
            >
              🎨 {metadata.imageStyle}
            </Box>
          )}
        </Box>

        {/* Main Content */}
        {hasContent && (
          <Box sx={{ px: 3 }}>
            {generatedContent ? (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'text.primary' }}>
                {generatedContent}
              </Typography>
            ) : post.message ? (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'text.primary' }}>
                {post.message}
              </Typography>
            ) : (
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                  Generated from prompt: {metadata.generationPrompt}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Generation Details Card */}
        {metadata && Object.keys(metadata).length > 0 && (
          <Box sx={{ px: 3, pb: 1 }}>
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Iconify icon="solar:info-circle-bold" width={16} sx={{ color: 'info.main' }} />
                <Typography sx={{ typography: 'caption', fontWeight: 600, color: 'text.secondary' }}>
                  Generation Details
                </Typography>
              </Box>

              <Stack spacing={1}>
                {metadata.generationPrompt && (
                  <Box>
                    <Typography sx={{ typography: 'caption', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
                      Prompt
                    </Typography>
                    <Typography sx={{ typography: 'caption', color: 'text.primary', lineHeight: 1.5 }}>
                      {metadata.generationPrompt}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                  {metadata.originalTone && (
                    <Box>
                      <Typography sx={{ typography: 'caption', fontWeight: 600, color: 'text.secondary' }}>
                        Tone
                      </Typography>
                      <Typography sx={{ typography: 'caption', color: 'text.primary', textTransform: 'capitalize' }}>
                        {metadata.originalTone}
                      </Typography>
                    </Box>
                  )}
                  {metadata.tokensUsed && (
                    <Box>
                      <Typography sx={{ typography: 'caption', fontWeight: 600, color: 'text.secondary' }}>
                        Tokens Used
                      </Typography>
                      <Typography sx={{ typography: 'caption', color: 'text.primary' }}>
                        {metadata.tokensUsed}
                      </Typography>
                    </Box>
                  )}
                  {metadata.generatedBy && (
                    <Box>
                      <Typography sx={{ typography: 'caption', fontWeight: 600, color: 'text.secondary' }}>
                        Generated By
                      </Typography>
                      <Typography sx={{ typography: 'caption', color: 'text.primary', textTransform: 'capitalize' }}>
                        {metadata.generatedBy}
                      </Typography>
                    </Box>
                  )}
                  {metadata.generatedAt && (
                    <Box>
                      <Typography sx={{ typography: 'caption', fontWeight: 600, color: 'text.secondary' }}>
                        Generated
                      </Typography>
                      <Typography sx={{ typography: 'caption', color: 'text.primary' }}>
                        {fDate(metadata.generatedAt)}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Content Options */}
                {(metadata.includeEmojis || metadata.includeHashtags || metadata.imageStyle) && (
                  <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {metadata.includeEmojis && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Iconify icon="solar:emoji-bold" width={14} sx={{ color: 'success.main' }} />
                          <Typography sx={{ typography: 'caption', color: 'text.secondary' }}>
                            Emojis
                          </Typography>
                        </Box>
                      )}
                      {metadata.includeHashtags && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Iconify icon="solar:hashtag-bold" width={14} sx={{ color: 'info.main' }} />
                          <Typography sx={{ typography: 'caption', color: 'text.secondary' }}>
                            Hashtags
                          </Typography>
                        </Box>
                      )}
                      {metadata.imageUrl && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Iconify icon="solar:gallery-bold" width={14} sx={{ color: 'warning.main' }} />
                          <Typography sx={{ typography: 'caption', color: 'text.secondary' }}>
                            Image
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </Stack>
            </Box>
          </Box>
        )}
      </Stack>
    );
  };

  return (
    <Card>
      {renderHead()}

      {renderPostContent()}

      {getImageUrl() && (
        <Box sx={{ px: 3, py: 2 }}>
          <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', bgcolor: 'action.disabledBackground' }}>
            <Image
              alt="post media"
              src={getImageUrl()}
              ratio="16/9"
              sx={{ borderRadius: 2 }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                px: 1,
                py: 0.5,
                borderRadius: 0.75,
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Iconify icon="solar:gallery-bold" width={14} sx={{ color: 'white' }} />
              <Typography sx={{ typography: 'caption', color: 'white', fontWeight: 600 }}>
                Generated Image
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Card>
  );
}
