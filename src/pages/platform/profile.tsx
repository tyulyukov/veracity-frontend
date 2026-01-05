import { Link } from 'react-router';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Edit, Mail, Calendar, Briefcase } from 'lucide-react';
import { getFullStorageUrl } from '@/lib/storage';

export function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) return null;

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5" />

        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-12 mb-8">
            <Avatar
              src={getFullStorageUrl(user.avatarUrl)}
              firstName={user.firstName}
              lastName={user.lastName}
              seed={user.id}
              size="xl"
              className="border-4 border-card"
            />

            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold text-foreground">
                {user.firstName} {user.lastName}
              </h1>
              {user.position && (
                <p className="text-muted-foreground">{user.position}</p>
              )}
            </div>

            <Link to="/app/profile/edit">
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>

          {user.shortDescription && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-foreground mb-2">About</h3>
              <p className="text-muted-foreground">{user.shortDescription}</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Joined {joinDate}</span>
            </div>
            {user.position && (
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">{user.position}</span>
              </div>
            )}
          </div>

          {user.contactInfo && Object.keys(user.contactInfo).length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-foreground mb-3">Contact Info</h3>
              <div className="space-y-2">
                {Object.entries(user.contactInfo).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground capitalize">{key}:</span>
                    <span className="text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {user.interests.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest) => (
                  <Badge key={interest.id} variant="secondary">
                    {interest.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

