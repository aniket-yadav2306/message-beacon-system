
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

// User ID for demo purposes
const DEMO_USER_ID = "6578ecd98e5c3f001c123456";

const Index = () => {
  // State for form inputs
  const [userId, setUserId] = useState(DEMO_USER_ID);
  const [notificationType, setNotificationType] = useState("in-app");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !message) {
      toast({
        title: "Validation Error",
        description: "User ID and message are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // In a real app, this would make an actual API call
      console.log("Sending notification:", {
        userId,
        type: notificationType,
        message,
        metadata: { subject }
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Notification Sent",
        description: `Your ${notificationType} notification has been queued successfully.`,
      });
      
      // Clear form
      setMessage("");
      setSubject("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      });
      console.error("Error sending notification:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user notifications
  const fetchNotifications = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is required",
        variant: "destructive",
      });
      return;
    }
    
    setLoadingNotifications(true);
    
    try {
      // In a real app, this would make an actual API call
      console.log(`Fetching notifications for user: ${userId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock notifications data
      const mockNotifications = [
        {
          id: "not1",
          type: "in-app",
          message: "Welcome to our notification system!",
          status: "delivered",
          createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        },
        {
          id: "not2",
          type: "in-app",
          message: "Your account has been updated successfully.",
          status: "delivered",
          createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        },
        {
          id: "not3",
          type: "in-app",
          message: "New feature alert: Check out our new notification dashboard!",
          status: "delivered",
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        }
      ];
      
      setNotifications(mockNotifications);
      
      toast({
        title: "Notifications Loaded",
        description: `Loaded ${mockNotifications.length} notifications`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch notifications. Please try again.",
        variant: "destructive",
      });
      console.error("Error fetching notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Notification Service
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A powerful and flexible notification system for sending emails, SMS, and in-app notifications.
          </p>
        </header>

        <Tabs defaultValue="send" className="max-w-3xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="send">Send Notification</TabsTrigger>
            <TabsTrigger value="view">View Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle>Send a Notification</CardTitle>
                <CardDescription>
                  Create and queue a new notification for delivery.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">User ID</label>
                    <Input 
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Enter user ID"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notification Type</label>
                    <Select 
                      value={notificationType}
                      onValueChange={setNotificationType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select notification type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="in-app">In-App</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {notificationType === 'email' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject</label>
                      <Input 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Email subject"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter notification message"
                      rows={4}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send Notification"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="view">
            <Card>
              <CardHeader>
                <CardTitle>User Notifications</CardTitle>
                <CardDescription>
                  View all in-app notifications for a user.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input 
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Enter user ID"
                      className="flex-1"
                    />
                    <Button 
                      onClick={fetchNotifications} 
                      disabled={loadingNotifications}
                    >
                      {loadingNotifications ? "Loading..." : "Fetch"}
                    </Button>
                  </div>
                  
                  {notifications.length > 0 ? (
                    <div className="space-y-4 mt-6">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-notification">{notification.type}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-800">{notification.message}</p>
                          <div className="mt-2 flex justify-between items-center">
                            <span 
                              className={`text-xs px-2 py-1 rounded ${
                                notification.status === 'delivered' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {notification.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {loadingNotifications ? 
                        "Loading notifications..." : 
                        "No notifications to display. Click 'Fetch' to load notifications."}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
