import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getUsers } from '@/api/users.api';
import { getInterests } from '@/api/interests.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Loader2, Users, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OtherUser } from '@/types';

export function MembersPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data: interests = [] } = useQuery({
    queryKey: ['interests'],
    queryFn: getInterests,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['users', selectedInterests, debouncedSearch],
    queryFn: ({ pageParam }) =>
      getUsers({
        cursor: pageParam,
        limit: 12,
        interestIds: selectedInterests.length > 0 ? selectedInterests : undefined,
        search: debouncedSearch || undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const timeout = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
    return () => clearTimeout(timeout);
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSelectedInterests([]);
    setSearchQuery('');
    setDebouncedSearch('');
  };

  const hasFilters = selectedInterests.length > 0 || debouncedSearch;
  const allUsers = data?.pages.flatMap((page) => page.users) ?? [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Members</h1>
        <p className="text-muted-foreground">
          Discover and connect with fellow members
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Filter by interests</span>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors border',
                  selectedInterests.includes(interest.id)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'
                )}
              >
                {interest.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : allUsers.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No members found</h3>
          <p className="text-muted-foreground">
            {hasFilters ? 'Try adjusting your filters or search' : 'Be the first to join!'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allUsers.map((user) => (
              <MemberCard key={user.id} user={user} />
            ))}
          </div>

          {hasNextPage && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MemberCard({ user }: { user: OtherUser }) {
  return (
    <Link
      to={`/app/members/${user.id}`}
      className="block bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors"
    >
      <div className="flex items-start gap-4 mb-4">
        <Avatar
          src={user.avatarUrl}
          firstName={user.firstName}
          lastName={user.lastName}
          seed={user.id}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {user.firstName} {user.lastName}
          </h3>
          {user.position && (
            <p className="text-sm text-muted-foreground truncate">{user.position}</p>
          )}
        </div>
      </div>

      {user.shortDescription && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {user.shortDescription}
        </p>
      )}

      {user.interests.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {user.interests.slice(0, 3).map((interest) => (
            <Badge key={interest.id} variant="secondary" className="text-xs">
              {interest.name}
            </Badge>
          ))}
          {user.interests.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{user.interests.length - 3}
            </Badge>
          )}
        </div>
      )}
    </Link>
  );
}
